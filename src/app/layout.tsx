import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "../components/Nav";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main className="container">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
