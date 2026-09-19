using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Text;
using System.Windows.Forms;

[assembly: AssemblyTitle("Flip Clock Setup")]
[assembly: AssemblyProduct("Flip Clock")]
[assembly: AssemblyVersion("1.1.0.0")]
[assembly: AssemblyFileVersion("1.1.0.0")]

internal static class Setup
{
    [STAThread]
    private static int Main(string[] args)
    {
        bool verify = args.Length == 1 && args[0] == "/verify";
        if (verify) { try { Run(true); return 0; } catch { return 1; } }
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        if (MessageBox.Show("Install Flip Clock and its screensaver for your Windows account?\n\nSetup adds desktop and Start menu shortcuts and enables the screensaver after five minutes (or your existing shorter delay), with sign-in required on resume.\n\nThe clock is standalone. WebView2 Runtime is required for the screensaver.", "Flip Clock Setup", MessageBoxButtons.OKCancel, MessageBoxIcon.Information) != DialogResult.OK) return 0;
        int result = 0;
        using (var form = new Form { Text = "Flip Clock Setup", ClientSize = new Size(420, 110), StartPosition = FormStartPosition.CenterScreen, FormBorderStyle = FormBorderStyle.FixedDialog, MaximizeBox = false, MinimizeBox = false, ControlBox = false })
        {
            form.Controls.Add(new Label { Text = "Installing Flip Clock and screensaver...", AutoSize = true, Location = new Point(24, 22) });
            form.Controls.Add(new ProgressBar { Style = ProgressBarStyle.Marquee, Location = new Point(24, 58), Size = new Size(372, 20) });
            var worker = new BackgroundWorker();
            worker.DoWork += delegate { Run(false); };
            worker.RunWorkerCompleted += delegate(object sender, RunWorkerCompletedEventArgs e) {
                if (e.Error != null) {
                    result = 1;
                    MessageBox.Show(form, "Setup could not finish.\n\n" + e.Error.Message, "Flip Clock Setup", MessageBoxButtons.OK, MessageBoxIcon.Error);
                } else {
                    MessageBox.Show(form, "Flip Clock and its screensaver are installed.\n\nOpen Flip Clock from your desktop or Start menu. Use Configure Flip Clock Screensaver in Start to choose its appearance.", "Flip Clock installed", MessageBoxButtons.OK, MessageBoxIcon.Information);
                }
                form.Close();
            };
            form.Shown += delegate { worker.RunWorkerAsync(); };
            Application.Run(form);
        }
        return result;
    }

    private static void Run(bool verify)
    {
        string tempRoot = Path.GetFullPath(Path.GetTempPath());
        string directory = Path.GetFullPath(Path.Combine(tempRoot, "FlipClock-Setup-" + Guid.NewGuid().ToString("N")));
        if (!directory.StartsWith(tempRoot.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new IOException("Invalid setup temporary directory.");
        Directory.CreateDirectory(directory);
        try {
            using (Stream payload = Assembly.GetExecutingAssembly().GetManifestResourceStream("FlipClock.Payload.zip"))
            using (var archive = new ZipArchive(payload, ZipArchiveMode.Read)) { archive.ExtractToDirectory(directory); }
            string windows = Path.Combine(directory, "Windows");
            foreach (string file in new[] { "Install.ps1", "Install-Screensaver.ps1", "Uninstall.ps1", "Remove-Screensaver.ps1", "index.html", "app.js", "background.js", "timer.js", "style.css", "icon.ico", "icon.png", "icon.svg", "Start Flip Clock.cmd", "FlipClock.scr", "Microsoft.Web.WebView2.Core.dll", "Microsoft.Web.WebView2.WinForms.dll", "WebView2Loader.dll", "WebView2-LICENSE.txt", "WebView2-NOTICE.txt" }) {
                if (!File.Exists(Path.Combine(windows, file))) throw new IOException("Setup is missing " + file);
            }
            foreach (string file in new[] { "awake.js", "runtime-files.json", "app/Flip Clock.exe", "app/resources/app.asar" }) {
                if (!File.Exists(Path.Combine(windows, file))) throw new IOException("Setup is missing " + file);
            }
            if (verify) return;
            var info = new ProcessStartInfo {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell\\v1.0\\powershell.exe"),
                Arguments = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"" + Path.Combine(windows, "Install-Screensaver.ps1") + "\"",
                UseShellExecute = false, CreateNoWindow = true, RedirectStandardOutput = true, RedirectStandardError = true
            };
            var output = new StringBuilder();
            using (var process = new Process { StartInfo = info }) {
                DataReceivedEventHandler capture = delegate(object sender, DataReceivedEventArgs e) { if (e.Data != null) lock (output) { output.AppendLine(e.Data); } };
                process.OutputDataReceived += capture;
                process.ErrorDataReceived += capture;
                process.Start();
                process.BeginOutputReadLine(); process.BeginErrorReadLine(); process.WaitForExit();
                if (process.ExitCode != 0) throw new InvalidOperationException(output.ToString());
            }
        } finally {
            // Only remove the unique temporary directory created by this invocation.
            try { Directory.Delete(directory, true); } catch (IOException) {} catch (UnauthorizedAccessException) {}
        }
    }
}
