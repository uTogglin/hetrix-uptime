"use client"

import { Monitor } from "@/types/monitor"
import { UptimeMonitor } from "@/components/uptime-monitor"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshButton } from "@/components/ui/refresh-button"
import { AlertTriangle, CheckCircle, ChevronDown, XCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import * as _moment from "moment"
import { Moment } from "moment"
import { DateRange, extendMoment, } from 'moment-range';
import "@/styles/uptime-bars.css"
import { Downtime } from "@/types/hetrix"
import { Tooltip, TooltipTrigger, TooltipPortal, TooltipContent, } from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils"

const moment = extendMoment(_moment);

const STORAGE_KEY = 'closedMonitors'

const categoryVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.2
      }
    }
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.2,
        delay: 0.1
      }
    }
  }
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const monitorVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

interface MonitorGridProps {
  monitors: Monitor[]
  loading: boolean
  error: string | null
  onRefresh: () => Promise<void>
}

interface DayStatus {
  status: "up" | "down" | "maintenance";
  date: Moment;
  count: number;
  downtime: number;
}

export function calculateDailyStatus(downtimes: Downtime[]): DayStatus[] {
    const momentDowntimes = downtimes.map(({start, end, maintenance}) => ({
      range: moment.range(moment.unix(start),
                          moment.unix(end)),
      maintenance,
    }))
    const result: DayStatus[] = [];

    for (let i = 60; i >= 0; i--) {
        const day = moment().subtract(i, 'days');
        const dayRange = moment.range(day.clone().startOf('day'),
                                     day.clone().endOf('day'));

        let incidentCount = 0;
        let foundMaintenance = false;
        let foundDowntime = false;
        let downtime = 0;

        for (const d of momentDowntimes) {
            // Check if downtime overlaps with the current day
            if (dayRange.overlaps(d.range)) {
                incidentCount++;
                downtime += (dayRange.clone().intersect(d.range) as DateRange).valueOf();

                if (!d.maintenance) {
                    foundDowntime = true;
                } else {
                    foundMaintenance = true;
                }
            }
        }

        // Determine status for the day
        let status: "up" | "down" | "maintenance";
        if (foundMaintenance) {
            status = "maintenance";
        } else if (foundDowntime) {
            status = "down";
        } else {
            status = "up";
        }

        result.push({ status, count: incidentCount, date: day, downtime });
    }

    return result;
}

export function MonitorGrid({ monitors, loading, error, onRefresh }: MonitorGridProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [closedMonitors, setClosedMonitors] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save open categories to localStorage
  useEffect(() => {
    if (closedMonitors.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(closedMonitors))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [closedMonitors])

  const toggleMonitor = useCallback((category: string) => {
    setClosedMonitors(prev => {
      const newState = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
      return newState
    })
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">System Status</h2>
          <p className="text-sm text-muted-foreground">
            Monitor status and server metrics
          </p>
        </div>
        <RefreshButton onClick={handleRefresh} loading={loading || isRefreshing} />
      </div>


      {loading && !monitors.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i} 
              className="h-[120px] rounded-lg" 
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {monitors.map((monitor) => {
            const getStatusIcon = (status: 'up' | 'maintenance' | 'down') => {
              switch (status) {
               case 'up':
                  return <CheckCircle className="h-4 w-4 text-green-500" />;
                case 'maintenance':
                  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                default:
                  return <XCircle className="h-4 w-4 text-red-500" />;
              }
            };

            const getBgStatusColor = (status: 'up' | 'maintenance' | 'down') => {
              switch (status) {
                case 'up':
                  // return "text-green-500 border-green-500/20 bg-green-600 hover:bg-green-700";
                  return "text-green-500 border-green-500/20 bg-green-500 hover:bg-green-600";
                case 'maintenance':
                  return "text-yellow-500 border-yellow-500/20 bg-yellow-500 hover:bg-yellow-600";
                default:
                  return "text-red-500 border-red-500/20 bg-red-600 hover:bg-red-600";
              }
            };

            const getStatusColor = (status: 'up' | 'maintenance' | 'down') => {
              switch (status) {
                case 'up':
                  // return "text-green-500 border-green-500/20 bg-green-600 hover:bg-green-700";
                  return "text-green-500 border-green-500/20";
                case 'maintenance':
                  return "text-yellow-500 border-yellow-500/20";
                default:
                  return "text-red-500 border-red-500/20";
              }
            };

            function toTitleCase(str: string) {
              return str.replace(
                /\w\S*/g,
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
              );
            }

            const lastDowntime = Math.max(...monitor.downtimes.map((downtime) => downtime.end))
            const downtimeDays = calculateDailyStatus(monitor.downtimes);

            console.log("Downtime Ranges: ", monitor.downtimes);
            console.log(`Last downtime: ${lastDowntime}, Downtime Days:`, downtimeDays);

            return (
              <div
                key={monitor.id}
                className="overflow-hidden rounded-lg border bg-card"
              >
                <button
                  onClick={() => toggleMonitor(monitor.id)}
                  className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(monitor.status)}
                    <span className="font-medium">{monitor.name}</span>

                    <Badge variant="outline" className="text-xs">
                      {monitor.uptime.toFixed(2)}% uptime
                    </Badge>

                    <Badge variant="outline" className="text-xs">
                      Last Down: {lastDowntime !== -Infinity ? moment.unix(lastDowntime).fromNow() : 'Never'}
                    </Badge>
                  </div>
                  <motion.div
                    animate={{ rotate: closedMonitors.includes(monitor.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

	             <div className="col-md-10 mx-auto">
	             	<div className='status-page__resource-ticks m-3 gap-[6px]'>
                         {
                             downtimeDays.map((downtime, index) => {
                               console.log(downtime.status);
                               const className = `status-page__resource-tick-inner ${getBgStatusColor(downtime.status)} rounded hover:scale-y-125 transition-transform duration-500`;
	             		         return (
                                 <Tooltip key={index}>
                                 <TooltipTrigger asChild>
                                 <div className='status-page__resource-tick'>
	             			           <div
	             			    	       className={className}
	             			           ></div>
	             		           </div>
                                 </TooltipTrigger>
                                 <TooltipPortal>
                                 <TooltipContent className="TooltipContent" sideOffset={5}>

        <div className={cn(
            "group relative overflow-hidden rounded-lg border bg-card p-4 min-w-lg",
            "hover:shadow-sm transition-all duration-200"
        )}>
            <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {getStatusIcon(downtime.status)}
                        <h3 className="font-medium truncate">{downtime.date.format('YYYY-MM-DD')}</h3>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "capitalize shrink-0",
                            getStatusColor(downtime.status)
                        )}
                    >
                        {downtime.status}
                    </Badge>
                </div>

                {/* Stats
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className={cn(
                        "font-medium",
                        location. >= 99 ? "text-green-500" :
                        location.uptime >= 95 ? "text-yellow-500" :
                        "text-red-500"
                    )}>
                        {location.uptime.toFixed(2)}%
                    </span>
                </div> */}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Incidents</span>
                    <span className={cn(
                        "font-medium",
                    )}>
                        {downtime.count}
                    </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Downtime</span>
                    <span className={cn(
                        "font-medium",
                    )}>
                                 {downtime.downtime === 0 ? "None" : toTitleCase(moment.duration(downtime.downtime).humanize())}
                    </span>
                </div>
            </div>
        </div>

                                 </TooltipContent>
                                 </TooltipPortal>
                                 </Tooltip>
                              )})
                         }
	             	</div>
	             </div>

                <div></div>
                <AnimatePresence initial={false}>
                  {closedMonitors.includes(monitor.id) && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={categoryVariants}
                      className="border-t bg-card/50 overflow-hidden"
                    >
                      <motion.div
                        className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3"
                        variants={gridVariants}
                      >
                        {monitor.locations ?
                          Object.entries(monitor.locations).map(([name, location]) => (
                          <motion.div
                            key={name}
                            variants={monitorVariants}
                          >
                            <UptimeMonitor name={name} location={location} />
                          </motion.div>
                        )) : ''}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
