# Better Hetrix Status

A modern, beautiful status page built on top of the Hetrix Tools API, created by irazz. This project transforms the standard Hetrix monitoring data into an elegant, user-friendly status dashboard.

> Note: No API keys in the commit history are valid.

## Demo

https://status.traumasoftware.net (Deployed on Cloudflare Pages)

## Getting Started

Method 1: Cloudflare Pages (Recommended)

1. Clone the repo
2. Add it to Pages
3. Set up your environment variables:
   - `HETRIX_API_TOKEN=<your_api_key>`
   - `NEXT_PUBLIC_SHOW_SYSTEM_STATS=true` (optional, will use a lot of requests for system usage if you have a lot of monitors)
   - `NEXT_PUBLIC_SHOW_NETWORK_STATS=false` (disable this if you disabled system stats too)
   - `NODE_VERSION=22.1.0`
4. Deploy and Enjoy

Method 2: Other

1. Clone the repository

```bash
git clone https://github.com/unclevak/status-page.git
cd status-page
```

2. Install dependencies
   Install [node.js](https://nodejs.org/en) version 22

```bash
npm install -g pnpm@latest-10
pnpm install
```

3. Set up your environment variables

```bash
cp .env.example .env
```

Add your Hetrix Tools API key to `.env`

4. Run the development server

```bash
pnpm dev
```

## Environment Variables

- `HETRIX_API_KEY` - Your Hetrix Tools API key
- `SHOW_SYSTEM_STATS` - Toggle system usage statistics display (true/false)

> Note: No API keys in the commit history are valid.

## Tech Stack

- Next.js 15
- TypeScript
- Edge Runtime
- Tailwind CSS

## API

This also offers a simple API for fetching data.

- `/api/monitors`: Fetches all monitors
- `/api/monitors/:id/stats`: Fetches a specific monitor by ID, the ID is the one from hetrix

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.
