import React from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, BanknoteIcon, CreditCardIcon } from "lucide-react";
import { SiPaypal, SiStripe, SiVisa, SiMastercard, SiApple, SiGoogle } from "react-icons/si";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const paymentMethods = [
    { id: "manual", name: "Manual Payment", icon: <BanknoteIcon className="h-8 w-8" /> },
    { id: "stripe", name: "Credit Card", icon: <SiStripe className="h-8 w-8" /> },
    { id: "paypal", name: "PayPal", icon: <SiPaypal className="h-8 w-8" /> },
    { id: "paystack", name: "Paystack", icon: <CreditCardIcon className="h-8 w-8" /> },
    { id: "flutterwave", name: "Flutterwave", icon: <CreditCardIcon className="h-8 w-8" /> },
    { id: "remitano", name: "Crypto", icon: <CreditCard className="h-8 w-8" /> },
  ];

  return (
    <div>
      <h3 className="font-medium mb-3">Payment Method</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {paymentMethods.map((method) => (
          <Button
            key={method.id}
            variant="outline"
            className={`bg-slate-800 rounded-lg p-3 flex flex-col justify-center items-center border ${
              selectedMethod === method.id
                ? "border-primary-500"
                : "border-slate-700 hover:border-primary-500"
            } h-24`}
            onClick={() => onSelectMethod(method.id)}
          >
            {method.icon}
            <span className="mt-2 text-xs">{method.name}</span>
          </Button>
        ))}
      </div>
      
      {selectedMethod === 'stripe' && (
        <div className="mt-4 bg-slate-800 border border-slate-700 rounded-md p-4">
          <h4 className="text-sm font-medium mb-3">Accepted Cards</h4>
          <div className="flex space-x-4">
            <SiVisa className="h-8 w-8 text-blue-500" />
            <SiMastercard className="h-8 w-8 text-orange-500" />
            <SiApple className="h-8 w-8 text-gray-400" />
            <SiGoogle className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}
      
      {selectedMethod === 'manual' && (
        <div className="mt-4 bg-slate-800 border border-slate-700 rounded-md p-4">
          <h4 className="text-sm font-medium mb-2">Manual Payment Instructions</h4>
          <p className="text-sm text-gray-400 mb-2">
            Please make a payment to the following account and provide the transaction details below:
          </p>
          <div className="bg-slate-900 p-3 rounded text-sm mb-3">
            <p><span className="text-gray-500">Bank:</span> Global Bank</p>
            <p><span className="text-gray-500">Account Name:</span> OmniDev Inc</p>
            <p><span className="text-gray-500">Account Number:</span> 1234567890</p>
            <p><span className="text-gray-500">Reference:</span> [Your Email]</p>
          </div>
          <p className="text-xs text-yellow-500">
            Note: Manual payments require admin approval before your subscription is activated.
          </p>
        </div>
      )}
      
      {selectedMethod === 'remitano' && (
        <div className="mt-4 bg-slate-800 border border-slate-700 rounded-md p-4">
          <h4 className="text-sm font-medium mb-2">Crypto Payment Details</h4>
          <p className="text-sm text-gray-400 mb-2">
            Send your payment to the following wallet address:
          </p>
          <div className="bg-slate-900 p-3 rounded text-sm mb-3 break-all">
            <p><span className="text-gray-500">BTC:</span> 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5</p>
            <p><span className="text-gray-500">ETH:</span> 0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
          </div>
          <p className="text-xs text-yellow-500">
            Please note that crypto payments may take longer to process.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
