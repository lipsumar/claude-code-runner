import app from './app';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Please set the ANTHROPIC_API_KEY environment variable');
  process.exit(1);
}

app.listen(4000, () => {
  console.log('> Ready on http://localhost:4000');
});
