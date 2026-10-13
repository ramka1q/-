package android.webkit; import android.content.Context; public class WebView extends android.view.View {
  public WebView(Context c) {} public WebSettings getSettings() { return null; } public void setWebViewClient(WebViewClient c) {}
  public void setWebChromeClient(WebChromeClient c) {} public void loadUrl(String u) {} public void evaluateJavascript(String s, ValueCallback<String> cb) {}
  public void onPause() {} public void onResume() {} }
