export interface DailyStatus {
  date: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  responseTime?: number;
}

export interface Info {
  responseTime?: number;
  uptimeStatus: 'up' | 'down' | 'maintenance';
  lastCheck: number;
}

export interface Monitor {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'down' | 'unknown';
  uptime: number;
  lastCheck: number;
  type: string;
  category: string;
  hasAgent: boolean;
  history?: DailyStatus[];
  locations?: {
        [key: string]: Info;
  };
}
