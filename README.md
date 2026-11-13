# StudySync starter

This is a first working website scaffold for StudySync.

## Included
- Responsive dark StudySync interface
- First-time onboarding: name, school, year/grade, curriculum, qualification/pathway, subject choices, AI companion name and personality
- Home dashboard and subject navigation
- Subject pages with AI assistant entry, quiz generation entry, topic suggestions and materials area
- General AI companion UI
- Study planner and learning library starter screens
- Settings
- Browser-local saving for profile, task list and uploaded file names
- Server-side Gemini API route (API key stays on the server)

## Important limitations in this first version
- No student accounts or cloud sync yet.
- Profile, tasks and file names are saved only in the current browser on this device.
- File selection currently records file names only; it does not securely upload, parse, or extract topics from the documents.
- Topic suggestions are starter examples, not extracted from a school's syllabus.
- AI needs a Gemini API key and may have usage limits.
- No real analytics or progress statistics are fabricated.

## Deploy
Use Node.js 20.9+ in a development environment. Install packages with `npm install`, then run `npm run dev`.
For Vercel, import this GitHub repository and add `GEMINI_API_KEY` in Project Settings > Environment Variables before using the AI route.

Never put API keys in frontend code or commit them to GitHub.
