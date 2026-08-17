export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: 'UPI' | 'CARD' | 'NETBANKING' | 'COD';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  upiId?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
  gatewayResponse: {
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    method: string;
    authCode?: string;
    receiptNumber?: string;
    timestamp: string;
    errorCode?: string;
  };
}

/**
 * Simulates a realistic payment gateway (e.g. Razorpay/Stripe/UPI Gateway)
 */
export async function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  // Simulate network latency (200ms)
  await new Promise((res) => setTimeout(res, 200));

  const timestamp = new Date().toISOString();
  const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Cash on delivery is immediately confirmed
  if (req.method === 'COD') {
    return {
      success: true,
      transactionId,
      message: 'Cash on delivery selected. Payment due upon arrival.',
      gatewayResponse: {
        status: 'SUCCESS',
        method: 'COD',
        receiptNumber: `COD-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp,
      },
    };
  }

  // UPI Simulation
  if (req.method === 'UPI') {
    // If UPI ID contains "fail" or invalid formatting, trigger mock failure
    if (req.upiId && req.upiId.toLowerCase().includes('fail')) {
      return {
        success: false,
        transactionId,
        message: 'UPI payment failed: Bank server declined the transaction.',
        gatewayResponse: {
          status: 'FAILED',
          method: 'UPI',
          errorCode: 'UPI_BANK_DECLINE',
          timestamp,
        },
      };
    }

    return {
      success: true,
      transactionId,
      message: 'UPI Payment processed successfully.',
      gatewayResponse: {
        status: 'SUCCESS',
        method: 'UPI',
        authCode: `AUTH_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp,
      },
    };
  }

  // Card Simulation
  if (req.method === 'CARD') {
    if (req.cardNumber && req.cardNumber.replace(/\s/g, '').endsWith('0000')) {
      return {
        success: false,
        transactionId,
        message: 'Card payment failed: Insufficient funds or invalid card.',
        gatewayResponse: {
          status: 'FAILED',
          method: 'CARD',
          errorCode: 'CARD_INSUFFICIENT_FUNDS',
          timestamp,
        },
      };
    }

    return {
      success: true,
      transactionId,
      message: 'Card transaction authorized successfully.',
      gatewayResponse: {
        status: 'SUCCESS',
        method: 'CARD',
        authCode: `AUTH_CARD_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp,
      },
    };
  }

  // Default / Netbanking success
  return {
    success: true,
    transactionId,
    message: 'Net Banking transaction verified successfully.',
    gatewayResponse: {
      status: 'SUCCESS',
      method: req.method,
      authCode: `NB_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp,
    },
  };
}
