import { supabase } from '../lib/supabase';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
}

class PaymentService {
  /**
   * Create a checkout session (Simulated)
   */
  async createCheckoutSession(tier: SubscriptionTier, amount: number): Promise<PaymentSession> {
    // In a real app, this would call a Supabase Edge Function to hit Stripe/Razorpay API
    return {
      id: `pay_${Math.random().toString(36).slice(2, 11)}`,
      amount,
      currency: 'INR',
      status: 'created'
    };
  }

  /**
   * Complete payment and update profile (Simulated)
   */
  async completePayment(userId: string, sessionId: string, tier: SubscriptionTier): Promise<boolean> {
    try {
      // 1. Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_tier: tier,
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // 3. Log the "transaction"
      console.log(`Payment ${sessionId} successful for user ${userId}. Tier: ${tier}`);
      
      return true;
    } catch (error) {
      console.error('Payment completion failed:', error);
      return false;
    }
  }

  /**
   * Get current subscription
   */
  async getSubscription(userId: string): Promise<{ tier: SubscriptionTier, status: string } | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !data) return { tier: 'free', status: 'active' };
    
    return {
      tier: data.subscription_tier as SubscriptionTier,
      status: data.subscription_status
    };
  }
}

export const paymentService = new PaymentService();
