import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useState } from 'react';
import { OutcomeVerifierResult } from './OutcomeVerifierResult';
import { OutcomeVerifierForm } from './OutcomeVerifierForm';
import { VerificationResult } from '@/types';
import { Github } from 'lucide-react';

export function OutcomeVerifier() {
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Outcome Verifier</CardTitle>
        <CardDescription>
          Verify the outcome of a game using the server seed, client seed, and nonce. By providing the server seed hash, you can verify
          that the outcome has not been tampered with.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OutcomeVerifierForm onVerificationChange={setVerificationResult} />
        <div className="flex justify-center">
          <a
            href="https://github.com/SirVizzy/acebet-verifier"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-4" />
            <span className="text-sm">View on GitHub</span>
          </a>
        </div>
        {verificationResult && <OutcomeVerifierResult verificationResult={verificationResult} />}
      </CardContent>
    </Card>
  );
}
