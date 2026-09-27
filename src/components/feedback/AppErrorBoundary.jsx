import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Ứng dụng gặp lỗi khi hiển thị giao diện.',
    };
  }

  componentDidCatch(error, info) {
    console.error('App render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-canvas p-6 flex items-center justify-center text-text-primary">
        <div className="w-full max-w-xl rounded-3xl border border-hairline bg-white p-8 shadow-[0_16px_40px_-8px_rgba(45,55,72,0.08)] text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">
            Đã xảy ra lỗi hiển thị
          </h1>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-4">
            Rất tiếc vì sự bất tiện này. Ba mẹ vui lòng tải lại trang hoặc thử lại sau ít phút.
          </p>
          {this.state.message && (
            <pre className="mt-3 mb-6 overflow-auto rounded-xl bg-gray-50 border border-hairline p-3 text-xs text-left text-gray-700 font-mono max-h-40">
              {this.state.message}
            </pre>
          )}
          <Button
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
