import "@/app/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { EnvProvider } from "@/providers/env-provider";
import { env } from "@/utils/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "uTogglin | System Status",
  description:
    "Find the latest status updates and system monitoring for the entire uTogglin infrastructure.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <EnvProvider
          showSystemStats={env.showSystemStats}
          showCpuStats={env.showCpuStats}
          showRamStats={env.showRamStats}
          showDiskStats={env.showDiskStats}
          showNetworkStats={env.showNetworkStats}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </EnvProvider>
      </body>
    </html>
  );
}
