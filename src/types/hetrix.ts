export interface RawHetrixMonitor {
    ID?: string;
    id?: string;
    Name?: string;
    name?: string;
    target: string;
    Status: number;
    uptime_status: 'up' | 'down' | 'maintenance';
    monitor_status: 'active' | 'maintenance' | 'inactive';
    uptime: string | number;
    last_check: number;
    type?: string;
    category?: string;
    monitor_type?: string;
    Response_Time?: number;
    locations: {
        [key: string]: {
            response_time?: number;
            uptime_status: 'up' | 'down' | 'maintenance';
            last_check: number;
        };
    };
}

export interface Downtime {
    id: string;
    start: number;
    end: number;
    maintenance: boolean;
}

export interface HetrixDowntimes {
    downtimes: Downtime[];
}

export interface HetrixResponse {
    status: string;
    monitors: RawHetrixMonitor[];
}

export interface ServerStats {
    status: string;
    data: {
        cpu: number;
        ram: number;
        disk: number;
        network: {
            in: number;
            out: number;
        };
        timestamp: string;
    };
}
