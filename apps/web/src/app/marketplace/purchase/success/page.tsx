"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Download, 
  ArrowRight, 
  Home,
  CreditCard,
  Zap
} from "lucide-react";
import Link from "next/link";

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Fetch purchase details from backend
      fetchPurchaseDetails(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchPurchaseDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/v1/stripe/session-details?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setPurchaseDetails(data);
      }
    } catch (error) {
      console.error("Failed to fetch purchase details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your purchase details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-green-600">
              Purchase Successful! 🎉
            </h1>
            <p className="text-xl text-muted-foreground">
              Thank you for your purchase. Your item is now available for use.
            </p>
          </div>

          {/* Purchase Details Card */}
          {purchaseDetails && (
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Item:</span>
                    <p className="font-medium">{purchaseDetails.item_name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Amount:</span>
                    <p className="font-medium">${purchaseDetails.amount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Order ID:</span>
                    <p className="font-mono text-xs">{purchaseDetails.order_id}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Date:</span>
                    <p className="font-medium">
                      {new Date(purchaseDetails.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Install Your Item</p>
                    <p className="text-sm text-muted-foreground">
                      Your purchased item is ready to be installed and configured.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Configure & Customize</p>
                    <p className="text-sm text-muted-foreground">
                      Set up your item according to your specific needs and preferences.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Start Using</p>
                    <p className="text-sm text-muted-foreground">
                      Begin leveraging your new tool to improve your workflow.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="flex items-center gap-2"
              onClick={() => router.push("/dashboard")}
            >
              <Zap className="w-5 h-5" />
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push("/marketplace")}
            >
              Browse More Items
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              A confirmation email has been sent to your registered email address.
            </p>
            <p>
              Need help? Contact our support team at{" "}
              <a href="mailto:support@codexos.dev" className="text-primary hover:underline">
                support@codexos.dev
              </a>
            </p>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/docs" className="text-primary hover:underline">
                Documentation
              </Link>
              <Link href="/community" className="text-primary hover:underline">
                Community
              </Link>
              <Link href="/support" className="text-primary hover:underline">
                Support
              </Link>
              <Link href="/marketplace" className="text-primary hover:underline">
                Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
