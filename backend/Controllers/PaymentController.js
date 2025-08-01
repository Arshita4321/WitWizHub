const PaytmChecksum = require('paytmchecksum');
const User = require('../Models/User');
const crypto = require('crypto');

// Paytm configuration (replace with your credentials)
const PAYTM_MID = 'YOUR_PAYTM_MERCHANT_ID'; // From Paytm Dashboard
const PAYTM_MERCHANT_KEY = 'YOUR_PAYTM_MERCHANT_KEY'; // From Paytm Dashboard
const PAYTM_WEBSITE = 'DEFAULT'; // Or 'WEBSTAGING' for testing
const PAYTM_HOST = 'https://securegw-stage.paytm.in'; // Use https://securegw.paytm.in for production

// Initiate payment
exports.initiatePayment = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const orderId = `ORDER_${Date.now()}_${userId}`;
    const customerId = userId;

    // Payment payload
    const paytmParams = {
      requestType: 'Payment',
      mid: PAYTM_MID,
      websiteName: PAYTM_WEBSITE,
      orderId: orderId,
      callbackUrl: 'http://localhost:3000/api/payment/callback',
      txnAmount: {
        value: amount.toString(),
        currency: 'INR',
      },
      userInfo: {
        custId: customerId,
      },
    };

    // Generate checksum
    const checksum = await PaytmChecksum.generateSignature(
      JSON.stringify(paytmParams),
      PAYTM_MERCHANT_KEY
    );

    paytmParams.checksum = checksum;

    // Create payment URL
    const paymentUrl = `${PAYTM_HOST}/theia/api/v1/initiateTransaction?mid=${PAYTM_MID}&orderId=${orderId}`;

    res.status(200).json({
      success: true,
      paymentUrl,
      paytmParams,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

// Handle payment callback
exports.handlePaymentCallback = async (req, res) => {
  try {
    const {
      ORDERID,
      TXNAMOUNT,
      STATUS,
      TXNID,
      RESPCODE,
      RESPMSG,
      CHECKSUMHASH,
    } = req.body;

    // Verify checksum
    const isValidChecksum = PaytmChecksum.verifySignature(
      req.body,
      PAYTM_MERCHANT_KEY,
      CHECKSUMHASH
    );

    if (!isValidChecksum) {
      console.error('Checksum verification failed');
      return res.redirect('http://localhost:5173/premium?status=failed');
    }

    if (STATUS === 'TXN_SUCCESS' && RESPCODE === '01') {
      // Update user to premium
      const userId = ORDERID.split('_')[2];
      const premiumUntil = new Date();
      premiumUntil.setMonth(premiumUntil.getMonth() + 1); // 1-month subscription

      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumUntil,
      });

      console.log(`Payment successful for user ${userId}, TXNID: ${TXNID}`);
      res.redirect('http://localhost:5173?status=success');
    } else {
      console.error('Payment failed:', { RESPCODE, RESPMSG });
      res.redirect('http://localhost:5173/premium?status=failed');
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.redirect('http://localhost:5173/premium?status=error');
  }
};