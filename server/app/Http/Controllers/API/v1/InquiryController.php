<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    /**
     * Display a listing of inquiries.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof \App\Models\Admin) {
            $inquiries = Inquiry::with('opportunity.category')->latest()->get();
        } else {
            $inquiries = Inquiry::with('opportunity.category')
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('email', $user->email);
                })
                ->latest()
                ->get();
        }

        return response()->json([
            'inquiries' => $inquiries,
        ]);
    }

    /**
     * Store a newly created inquiry in storage (Public / Investor Portal).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opportunity_id' => 'nullable|exists:opportunities,id',
            'user_id' => 'nullable|exists:users,id',
            'investor_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'subject' => 'required|string|max:255',
            'purpose' => 'required|string|max:255',
            'letter_of_intent' => 'nullable|file|mimes:pdf|max:10240',
            'supporting_documents' => 'nullable|file|mimes:pdf,zip,rar|max:25600',
            'message' => 'required|string',
        ]);

        $loiPath = null;
        if ($request->hasFile('letter_of_intent')) {
            $path = $request->file('letter_of_intent')->store('inquiries/loi', 'public');
            $loiPath = '/storage/' . $path;
        }

        $supportingDocsPath = null;
        if ($request->hasFile('supporting_documents')) {
            $path = $request->file('supporting_documents')->store('inquiries/docs', 'public');
            $supportingDocsPath = '/storage/' . $path;
        }

        $userId = null;
        if (auth('sanctum')->check()) {
            $userId = auth('sanctum')->id();
        } elseif ($request->filled('user_id')) {
            $userId = $request->input('user_id');
        } else {
            $matchedUser = \App\Models\User::where('email', $validated['email'])->first();
            if ($matchedUser) {
                $userId = $matchedUser->id;
            }
        }

        $inquiry = Inquiry::create([
            'user_id' => $userId,
            'opportunity_id' => $validated['opportunity_id'] ?? null,
            'investor_name' => $validated['investor_name'],
            'email' => $validated['email'],
            'company' => $validated['company'] ?? null,
            'contact_number' => $validated['contact_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'subject' => $validated['subject'],
            'purpose' => $validated['purpose'],
            'letter_of_intent' => $loiPath,
            'supporting_documents' => $supportingDocsPath,
            'message' => $validated['message'],
            'status' => 'Pending',
        ]);

        try {
            $inquiry->load('opportunity');
            $projectName = $inquiry->opportunity ? $inquiry->opportunity->project_name : 'General Opportunity';
            \App\Models\AppNotification::create([
                'role' => 'admin',
                'type' => 'inquiry',
                'title' => 'New Investment Inquiry',
                'message' => "{$inquiry->investor_name}" . (!empty($inquiry->company) ? " ({$inquiry->company})" : "") . " submitted an inquiry for {$projectName}.",
                'action_url' => '/app/manageInquires?type=inquiry&id=' . $inquiry->id,
                'data' => [
                    'inquiry_id' => $inquiry->id,
                    'investor_name' => $inquiry->investor_name,
                    'company' => $inquiry->company,
                    'email' => $inquiry->email,
                    'project_name' => $projectName,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create inquiry notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Inquiry submitted successfully.',
            'inquiry' => $inquiry->load('opportunity'),
        ], 201);
    }

    /**
     * Display the specified inquiry.
     */
    public function show(Inquiry $inquiry): JsonResponse
    {
        return response()->json($inquiry->load('opportunity.category'));
    }

    /**
     * Update official review status and administrative notes for an inquiry.
     */
    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:Submitted,Pending,Under Review,Endorsed,Assistance Identified,Processing,Completed,Approved,Rejected,Responded',
            'admin_notes' => 'nullable|string',
        ]);

        $inquiry->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $inquiry->admin_notes,
            'reviewed_at' => now(),
        ]);

        try {
            $inquiry->load('opportunity');
            $projectName = $inquiry->opportunity ? $inquiry->opportunity->project_name : 'General Opportunity';
            $clientUser = \App\Models\User::where('email', $inquiry->email)->first();
            $clientUserId = $inquiry->user_id ?: ($clientUser ? $clientUser->id : null);

            \App\Models\AppNotification::create([
                'role' => 'client',
                'user_id' => $clientUserId,
                'type' => 'inquiry_status',
                'title' => 'Inquiry Status Updated',
                'message' => "Your investment intent for {$projectName} has advanced to '{$validated['status']}'.",
                'action_url' => '/portal/investorPortal?tab=inquiries&id=' . $inquiry->id,
                'data' => [
                    'inquiry_id' => $inquiry->id,
                    'project_name' => $projectName,
                    'status' => $validated['status'],
                    'admin_notes' => $validated['admin_notes'] ?? null,
                ],
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Failed to create client inquiry status notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Inquiry review status updated successfully.',
            'inquiry' => $inquiry->load('opportunity.category'),
        ]);
    }

    /**
     * Remove the specified inquiry from storage.
     */
    public function destroy(Inquiry $inquiry): JsonResponse
    {
        $inquiry->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully.',
        ]);
    }
}
