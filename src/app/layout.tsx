import type { Metadata } from 'next';
import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ConflictModal } from '@/components/cart/ConflictModal';

export const metadata: Metadata = {
  title: 'FlavorDash | Full-Stack Online Food Ordering System',
  description:
    'Experience lightning-fast food delivery from top local restaurants. Multi-role portal for Customers, Kitchen Staff, Delivery Partners, and Administrators.',
  keywords: ['food delivery', 'online food ordering', 'restaurant management', 'delivery tracking'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </div>
            <CartDrawer />
            <ConflictModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
