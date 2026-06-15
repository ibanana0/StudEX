import app from './app';
import './cron/autoClose.cron';
import './cron/autoCancel.cron';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

