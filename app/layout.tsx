import "./globals.css";

export const metadata: {
  title: string;
  description: string;
  manifest: string;
} = {
  title: "Castaway Council",
  description: "Real-time slow-burn social survival RPG",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#FF6B6B" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
