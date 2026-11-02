"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type State = { error: Error | null };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-md p-8 text-center">
          <p className="text-lg font-semibold">Algo quebrou nesta tela</p>
          <p className="mt-2 text-sm text-slate-500">
            {this.state.error.message}
          </p>
          <Button
            className="mt-4"
            onClick={() => {
              this.setState({ error: null });
              window.location.href = "/";
            }}
          >
            Voltar ao início
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
