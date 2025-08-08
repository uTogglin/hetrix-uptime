"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Info, Monitor } from '@/types/monitor';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from './ui/skeleton';
import moment from 'moment';

interface UptimeMonitorProps {
    name: string;
    location: Info;
}

export function UptimeMonitor({ name, location }: UptimeMonitorProps) {

    const getStatusIcon = () => {
        switch (location.uptimeStatus) {
            case 'up':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'down':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        }
    };

    const getStatusColor = () => {
        switch (location.uptimeStatus) {
            case 'up':
                return "text-green-500 border-green-500/20";
            case 'down':
                return "text-red-500 border-red-500/20";
            default:
                return "text-yellow-500 border-yellow-500/20";
        }
    };

    function camelCaseToWords(s: string) {
      const result = s
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ');
        return result.split(' ')
            .map(str => str.charAt(0).toUpperCase() + str.slice(1))
            .join(' ');
    }

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-lg border bg-card p-4",
            "hover:shadow-sm transition-all duration-200"
        )}>
            <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {getStatusIcon()}
                        <h3 className="font-medium truncate">{camelCaseToWords(name)}</h3>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "capitalize shrink-0",
                            getStatusColor()
                        )}
                    >
                        {camelCaseToWords(location.uptimeStatus)}
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

                { location.responseTime ?
                  <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response Time</span>
                      <span className={cn(
                          "font-medium",
                          location.responseTime <= 50 ? "text-green-500" :
                          location.responseTime <= 120 ? "text-yellow-500" :
                          "text-red-500"
                      )}>
                          {location.responseTime}ms
                      </span>
                  </div>
                    : ''
                }

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Checked</span>
                    <span className={cn(
                        "font-medium",
                    )}>
                      {location.lastCheck == 0 ? 'never'
                       : moment.unix(location.lastCheck).fromNow()}
                    </span>
                </div>
            </div>
        </div>
    );
}

/*
export function UptimeMonitorList() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [lastMonitors, setLastMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [masterShowStats, setMasterShowStats] = useState(false);

    const fetchMonitors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/monitors");
            if (!response.ok) {
                throw new Error("Failed to fetch monitors");
            }
            const data = await response.json();
            setMonitors(data.monitors);
            setLastMonitors(data.monitors); // Update last successful data
            localStorage.setItem('monitors', JSON.stringify(data.monitors)); // Cache the data in local storage
        } catch {
            setError("Failed to fetch monitors");
            setMonitors(lastMonitors); // Revert to last successful data
        } finally {
            setLoading(false);
        }
    }, [lastMonitors]);

    useEffect(() => {
        const cachedMonitors = localStorage.getItem('monitors');
        if (cachedMonitors) {
            setMonitors(JSON.parse(cachedMonitors)); // Load from local storage if available
        }
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 60000);
        return () => clearInterval(interval);
    }, [fetchMonitors]);

    if (error) {
        return (
            <div className="rounded-xl bg-red-50 p-8 animate-in fade-in duration-300">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                <Button
                    onClick={fetchMonitors}
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Status</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring dashboard</p>
                </div>
                <Button
                    onClick={() => setMasterShowStats(!masterShowStats)}
                    variant="outline"
                    size="sm"
                    className="transition-all duration-300 hover:shadow"
                >
                    {masterShowStats ? (
                        <><ChevronUp className="w-4 h-4 mr-2" /> Hide All Server Stats</>
                    ) : (
                        <><ChevronDown className="w-4 h-4 mr-2" /> Show All Server Stats</>
                    )}
                </Button>
                <Button
                    onClick={fetchMonitors}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="transition-all duration-300 hover:shadow"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading && monitors.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton 
                            key={`skeleton-${i}`} 
                            className="h-[120px] rounded-xl bg-gray-200 dark:bg-gray-700"
                        />
                    ))
                ) : (
                    monitors.map((monitor) => (
                        <UptimeMonitor key={monitor.id} monitor={monitor} />
                    ))
                )}
            </div>
        </div>
    );
}
*/
