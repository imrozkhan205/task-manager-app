// services/notifications.tsx

import * as Notifications from "expo-notifications";

// Set the notification handler to show alerts while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface TaskForNotification {
  _id: string;
  title: string;
  dueDate?: string;
  status: "pending" | "in progress" | "done";
}

/**
 * If a task is due today → schedule 2 notifications:
 * - One at 7:00 AM
 * - One at 12:00 PM (noon)
 */
export async function scheduleTodayTaskNotifications(
  currentTasks: TaskForNotification[]
) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = currentTasks.filter((task) => {
    if (!task.dueDate || task.status === "done") return false;

    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);

    return taskDate.getTime() === today.getTime();
  });

  for (const task of todayTasks) {
    // Notification times (7:00 AM and 12:00 PM today)
    const notifTimes = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 5, 30, 0),
      
    ];

    for (const notifTime of notifTimes) {
      if (notifTime > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `🚨 Task Reminder: ${task.title}`,
            body: `Your task is due today. Don't forget to complete it!`,
            data: { taskId: task._id, screen: "edit-task" },
            sound: true,
          },
          trigger: notifTime,
        });

        console.log(
          `✅ Scheduled notification for "${task.title}" at ${notifTime.toLocaleTimeString()}`
        );
      } else {
        console.log(
          `⏭ Skipped scheduling for "${task.title}" — ${notifTime.toLocaleTimeString()} is in the past.`
        );
      }
    }
  }
}
