const formatDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterday = (date = new Date()) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
};

export const calculateStars = (tasks = []) => tasks.filter((task) => task.completed).length * 10;

export const calculateProgressPercent = (tasks = []) => {
  if (!tasks.length) return 0;
  const completedCount = tasks.filter((task) => task.completed).length;
  return Math.round((completedCount / tasks.length) * 100);
};

export const updateStreakFromCompletion = (streakData = null, today = formatDate()) => {
  if (!streakData) {
    return { streak: 1, lastCompletedDate: today };
  }

  const { streak = 0, lastCompletedDate } = streakData;

  if (lastCompletedDate === today) {
    return { streak, lastCompletedDate: today };
  }

  if (lastCompletedDate === getYesterday(new Date(today))) {
    return { streak: streak + 1, lastCompletedDate: today };
  }

  return { streak: 1, lastCompletedDate: today };
};

export const getProgressRingColors = (progressPercent = 0) => {
  if (progressPercent >= 100) {
    return {
      borderTopColor: '#34d399',
      borderRightColor: '#34d399',
      borderBottomColor: '#34d399',
      borderLeftColor: '#34d399',
    };
  }

  if (progressPercent >= 75) {
    return {
      borderTopColor: '#60a5fa',
      borderRightColor: '#60a5fa',
      borderBottomColor: '#60a5fa',
      borderLeftColor: '#60a5fa',
    };
  }

  if (progressPercent >= 50) {
    return {
      borderTopColor: '#f59e0b',
      borderRightColor: '#f59e0b',
      borderBottomColor: '#1e3a5f',
      borderLeftColor: '#1e3a5f',
    };
  }

  if (progressPercent >= 25) {
    return {
      borderTopColor: '#f59e0b',
      borderRightColor: '#1e3a5f',
      borderBottomColor: '#1e3a5f',
      borderLeftColor: '#1e3a5f',
    };
  }

  return {
    borderTopColor: '#1e3a5f',
    borderRightColor: '#1e3a5f',
    borderBottomColor: '#1e3a5f',
    borderLeftColor: '#1e3a5f',
  };
};
