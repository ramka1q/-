package android.webkit; import android.net.Uri; public class WebChromeClient {
  public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) { return false; }
  public static abstract class FileChooserParams {} }
