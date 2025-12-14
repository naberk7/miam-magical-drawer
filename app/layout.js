import './globals.css'

export const metadata = {
  title: 'MIAM Magical Drawer',
  description: 'Join the festive musical note exchange!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
