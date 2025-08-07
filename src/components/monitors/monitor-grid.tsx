"use client"

import { Monitor } from "@/types/monitor"
import { UptimeMonitor } from "@/components/uptime-monitor"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshButton } from "@/components/ui/refresh-button"
import { AlertTriangle, CheckCircle, ChevronDown, FolderIcon, XCircle } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { groupMonitorsByCategory } from "@/utils/helpers"
import { motion, AnimatePresence } from "framer-motion"

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

  const toggleMonitor = useCallback((monitor: string) => {
    setClosedMonitors(prev => {
      const newState = prev.includes(monitor)
        ? prev.filter(c => c !== monitor)
        : [...prev, monitor]
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
            const getStatusIcon = () => {
              switch (monitor.status) {
                case 'operational':
                  return <CheckCircle className="h-4 w-4 text-green-500" />;
                case 'degraded':
                  return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
                default:
                  return <XCircle className="h-4 w-4 text-red-500" />;
              }
            };

            // const getStatusColor = () => {
            //   switch (monitor.status) {
            //     case 'operational':
            //       return "text-green-500 border-green-500/20";
            //     case 'degraded':
            //       return "text-yellow-500 border-yellow-500/20";
            //     default:
            //       return "text-red-500 border-red-500/20";
            //   }
            // };

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
                        {getStatusIcon()}
                    <span className="font-medium">{monitor.name}</span>

                    <Badge variant="outline" className="text-xs">
                      {monitor.uptime.toFixed(2)}% uptime
                    </Badge>
                  </div>
                  <motion.div
                    animate={{ rotate: closedMonitors.includes(monitor.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {closedMonitors.includes(monitor.id) || (
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
