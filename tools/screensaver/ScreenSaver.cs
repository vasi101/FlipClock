using System;
using System.Drawing;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

static class Program {
    internal static bool SecureMode;
    internal static bool Ending;
    [DllImport("user32.dll")] static extern bool LockWorkStation();
    [STAThread] static void Main(string[] args) {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        string mode = args.Length == 0 ? "/c" : args[0].ToLowerInvariant();
        if (mode.StartsWith("/p") || mode.StartsWith("-p")) {
            long handle;
            string value = mode.Contains(":") ? mode.Substring(3) : args.Length > 1 ? args[1] : "0";
            if (long.TryParse(value, out handle) && handle != 0) Application.Run(new ClockForm(false, new IntPtr(handle), false));
            return;
        }
        bool test = mode == "/test";
        SecureMode = mode == "/s" || mode == "-s";
        if (SecureMode) {
            foreach (Screen screen in Screen.AllScreens) {
                ClockForm form = new ClockForm(true, IntPtr.Zero, false);
                form.Bounds = screen.Bounds;
                form.Show();
            }
            Application.Run();
        } else Application.Run(new ClockForm(false, IntPtr.Zero, test));
    }
    internal static void End() {
        if (Ending) return;
        Ending = true;
        if (SecureMode) LockWorkStation();
        Application.Exit();
    }
}

sealed class ClockForm : Form {
    readonly WebView2 view = new WebView2();
    readonly bool saver, test;
    readonly IntPtr preview;
    readonly Timer input = new Timer();
    readonly Timer deadline = new Timer();
    uint initialInput;
    [StructLayout(LayoutKind.Sequential)] struct LastInput { public uint size, time; }
    [StructLayout(LayoutKind.Sequential)] struct Rect { public int left, top, right, bottom; }
    [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LastInput info);
    [DllImport("user32.dll")] static extern IntPtr SetParent(IntPtr child, IntPtr parent);
    [DllImport("user32.dll")] static extern int SetWindowLong(IntPtr window, int index, int value);
    [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr window, out Rect rect);
    [DllImport("user32.dll")] static extern bool IsWindow(IntPtr window);
    static uint InputTime() { LastInput info = new LastInput(); info.size = (uint)Marshal.SizeOf(info); GetLastInputInfo(ref info); return info.time; }
    public ClockForm(bool isSaver, IntPtr parent, bool isTest) {
        saver = isSaver; preview = parent; test = isTest;
        Text = "Flip Clock Screensaver — Settings";
        BackColor = Color.Black;
        Size = new Size(1100, 750);
        StartPosition = FormStartPosition.CenterScreen;
        if (saver || preview != IntPtr.Zero || test) { FormBorderStyle = FormBorderStyle.None; ShowInTaskbar = false; }
        if (saver) { StartPosition = FormStartPosition.Manual; TopMost = true; }
        if (test) { StartPosition = FormStartPosition.Manual; Location = new Point(-15000, -15000); }
        string icon = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
        if (File.Exists(icon)) Icon = new Icon(icon);
        view.Dock = DockStyle.Fill; view.DefaultBackgroundColor = Color.Black; Controls.Add(view);
        Shown += Initialize;
        FormClosing += delegate { if (saver && !Program.Ending) Program.End(); };
        FormClosed += delegate { input.Dispose(); deadline.Dispose(); view.Dispose(); };
    }
    async void Initialize(object sender, EventArgs args) {
        if (preview != IntPtr.Zero) {
            SetWindowLong(Handle, -16, 0x50000000); SetParent(Handle, preview);
            Rect rect; GetClientRect(preview, out rect); Bounds = new Rectangle(0, 0, rect.right, rect.bottom);
        }
        if (saver) {
            initialInput = InputTime();
            input.Interval = 150;
            input.Tick += delegate { if (InputTime() != initialInput) Program.End(); };
            input.Start();
        } else if (preview != IntPtr.Zero) {
            input.Interval = 500; input.Tick += delegate { if (!IsWindow(preview)) Close(); }; input.Start();
        }
        if (test) {
            deadline.Interval = 25000;
            deadline.Tick += delegate { WriteTest("FAIL: WebView2 initialization timed out"); Close(); };
            deadline.Start();
        }
        try {
            string profile = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "FlipClock", "ScreensaverProfile");
            var environment = await CoreWebView2Environment.CreateAsync(null, profile);
            await view.EnsureCoreWebView2Async(environment);
            view.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            view.CoreWebView2.Settings.AreDevToolsEnabled = false;
            view.CoreWebView2.Settings.AreBrowserAcceleratorKeysEnabled = false;
            view.CoreWebView2.IsMuted = saver || preview != IntPtr.Zero;
            view.CoreWebView2.NewWindowRequested += delegate(object s, CoreWebView2NewWindowRequestedEventArgs e) { e.Handled = true; };
            if (saver || preview != IntPtr.Zero || test) {
                await view.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("window.flipClockScreensaver=true;addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='.toolbar,.settings,.timer-badge,.audio-status,#notice{display:none!important}body,*{cursor:none!important}';document.head.append(s);});");
            }
            view.CoreWebView2.NavigationCompleted += async delegate(object s, CoreWebView2NavigationCompletedEventArgs e) {
                if (!test) return;
                string result = await view.ExecuteScriptAsync("JSON.stringify({loaded:!!document.querySelector('.number'),background:typeof updateGlass,timer:!!document.getElementById('timer-panel'),controlsHidden:getComputedStyle(document.querySelector('.toolbar')).display==='none'})");
                WriteTest(e.IsSuccess ? result : "FAIL: navigation failed"); deadline.Stop(); Close();
            };
            string page = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "index.html");
            view.Source = new Uri(page);
        } catch (Exception error) {
            if (test) { WriteTest("FAIL: " + error.Message); Close(); }
            else if (saver) Program.End();
            else { MessageBox.Show("The screensaver needs Microsoft Edge WebView2 Runtime.\n\n" + error.Message, "Flip Clock"); Close(); }
        }
    }
    void WriteTest(string result) { File.WriteAllText(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "screensaver-test.json"), result); }
}
