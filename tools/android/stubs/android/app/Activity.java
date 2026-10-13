package android.app; import android.content.Context; import android.content.Intent; import android.os.Bundle; import android.view.View; import android.view.Window;
  public class Activity extends Context { public static final int RESULT_OK = -1;
  protected void onCreate(Bundle b) {} public Window getWindow() { return null; } public void setContentView(View v) {}
  public void onWindowFocusChanged(boolean f) {} protected void onPause() {} protected void onResume() {} public void onBackPressed() {}
  public void finish() {} public void startActivityForResult(Intent i, int code) {} protected void onActivityResult(int a, int b, Intent d) {} }
