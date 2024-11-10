import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkSlotAvailability, bookTimeSlot } from '../services/timeSlots';
import { OrderDetails } from '../types';

export const Checkout: React.FC = () => {
  const { items, getTotal, clearCart, collectionTime } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (items.length === 0 || !collectionTime) {
      navigate('/cart');
    }
    if (!user) {
      navigate('/');
      alert('Please sign in to complete your order');
    }
  }, [items, collectionTime, navigate, user]);

  const handlePlaceOrder = async () => {
    if (!collectionTime || !user) return;

    setLoading(true);
    try {
      const isAvailable = await checkSlotAvailability(
        collectionTime.date,
        collectionTime.time
      );

      if (!isAvailable) {
        alert('Sorry, this time slot is no longer available. Please select another time.');
        navigate('/collection-time');
        return;
      }

      const orderDetails: Omit<OrderDetails, 'id'> = {
        items: items.map(item => ({
          product: {
            name: item.product.name,
            price: item.product.price
          },
          quantity: item.quantity
        })),
        total: getTotal(),
        pickupDate: collectionTime.date.toISOString(),
        pickupTime: collectionTime.time,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        userEmail: user.email || '',
        paymentStatus: 'pending'
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderDetails);
      await bookTimeSlot(collectionTime.date, collectionTime.time, orderRef.id);

      navigate('/confirmation', { 
        state: { orderDetails },
        replace: true 
      });

      setTimeout(() => clearCart(), 100);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!collectionTime || !user) return null;

  const total = getTotal();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Collection Time</h3>
        <p className="text-lg">
          {collectionTime.date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} at {collectionTime.time}
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between mb-3 pb-3 border-b">
            <div>
              <p className="font-medium">{item.product.name}</p>
              <p className="text-sm">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium">£{(item.product.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/collection-time')}
          className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Change Collection Time
        </button>
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};