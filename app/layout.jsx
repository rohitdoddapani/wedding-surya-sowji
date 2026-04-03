import './globals.css';

export const metadata = {
  title: 'OurBigDay',
  description: 'Create beautiful event microsites with hosted media, live streams, and guest interactions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
