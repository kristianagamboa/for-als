# Date Invitation Website

A pink, interactive date invitation built with plain HTML, CSS, and JavaScript. No frameworks, no build step.
Designed for laptops and desktops first (Chrome and Edge), with a touch-friendly layout for iPad.

## File structure

```text
date-invitation/
├── index.html          main site (all screens)
├── eula.html           the Terms and Conditions document (linked from two places)
├── css/style.css
├── js/
│   ├── config.js       Formspree URL, proposed time, cafe details, song paths, messages
│   ├── lilies.js       the Stargazer lily artwork (shared by index.html and eula.html)
│   └── script.js       app logic (screens, music, form, effects)
├── assets/
│   ├── images/pawfeecrust.png   (cafe logo)
│   ├── images/flowers/
│   ├── audio/pink.mp3, love.mp3
│   └── animations/
├── README.md
└── .gitignore
```

## Run locally

1. Open the folder in Visual Studio Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and choose "Open with Live Server".

Opening `index.html` by double-clicking also works, but Live Server is recommended.

## Audio

The site expects `assets/audio/pink.mp3` (plays from the disc click until the form is submitted) and
`assets/audio/love.mp3` (plays on the final screen). To change a song, replace the file or edit the
paths in `js/config.js`. If a file is missing, the site hides the music control, shows a small notice, and keeps working.
Browsers only allow audio after a click, which is why the disc screen exists.

## Images

Add a photo of the cafe at `assets/images/pawfeecrust.png` (the current one is the cafe logo; any image works if you keep the name or update index.html).
Until it exists, a pink lily placeholder is shown. Please only use a photo you have the right to use.

## Formspree

The endpoint is set in `js/config.js` under `formspree`. Check that the form in your Formspree dashboard is active
and that your email is verified. Submit a test response before sending the link. The success screen only appears
if Formspree confirms the submission, and failed attempts keep her answers so she can retry.

## Deploy on GitHub Pages

1. Create a GitHub repository and push this folder to it (audio and image files included).
2. Go to Settings, then Pages.
3. Under "Build and deployment", choose "Deploy from a branch", select `main` and `/ (root)`, then Save.
4. After a minute, the site is live at `https://<username>.github.io/<repo>/`.

All paths are relative, so it works from the repository subpath. GitHub warns about files over 50 MB; the current MP3s are well under that.

## Notes

- Desktop only effects: cursor ring, cursor sparkles, petals that react to the mouse, lily parallax.
  On iPad, taps create sparkles instead and petals drift on their own.
- Motion is reduced automatically when the device has "reduce motion" turned on.
- `eula.html` holds the surprise message. Edit the text there if you ever want to change it.
