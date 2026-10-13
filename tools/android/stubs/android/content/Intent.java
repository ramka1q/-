package android.content; import android.net.Uri; public class Intent {
  public static final String ACTION_GET_CONTENT = "android.intent.action.GET_CONTENT";
  public static final String CATEGORY_OPENABLE = "android.intent.category.OPENABLE";
  public Intent(String action) {} public Intent addCategory(String c) { return this; } public Intent setType(String t) { return this; }
  public Uri getData() { return null; } public static Intent createChooser(Intent target, CharSequence title) { return null; } }
