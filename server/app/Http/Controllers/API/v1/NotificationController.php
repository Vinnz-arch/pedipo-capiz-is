<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\AppNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get recent notifications and unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof Admin) {
            $query = AppNotification::forAdmin();
        } else {
            $query = AppNotification::forClient($user->id);
        }

        $unreadCount = (clone $query)->unread()->count();
        $notifications = $query->latest()->take(30)->get();

        return response()->json([
            'unread_count' => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $query = AppNotification::where('id', $id);
        if ($user instanceof Admin) {
            $query->where('role', 'admin');
        } else {
            $query->where('role', 'client')->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            });
        }

        $notification = $query->firstOrFail();
        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'notification' => $notification,
        ]);
    }

    /**
     * Mark all notifications as read for current user/role.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = AppNotification::query();
        if ($user instanceof Admin) {
            $query->where('role', 'admin');
        } else {
            $query->where('role', 'client')->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            });
        }

        $query->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $query = AppNotification::where('id', $id);
        if ($user instanceof Admin) {
            $query->where('role', 'admin');
        } else {
            $query->where('role', 'client')->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            });
        }

        $notification = $query->firstOrFail();
        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ]);
    }
}
