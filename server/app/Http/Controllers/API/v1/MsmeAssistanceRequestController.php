<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\MsmeAssistanceRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MsmeAssistanceRequestController extends Controller
{
    /**
     * Display a listing of MSME assistance requests.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user instanceof \App\Models\Admin) {
            // Admin gets all requests with user details
            $requests = MsmeAssistanceRequest::with('user')->latest()->get();
        } else {
            // Regular user gets only their own requests
            $requests = MsmeAssistanceRequest::where('user_id', $user->id)->latest()->get();
        }

        return response()->json([
            'requests' => $requests,
        ]);
    }

    /**
     * Store a newly created MSME assistance request.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_person' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'classification' => 'required|string|in:Simple Transaction,Complex Transaction',
            'description' => 'required|string',
            'request_letter' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
            'other_docs' => 'nullable|file|mimes:pdf,jpg,jpeg,png,zip,rar,doc,docx|max:25600',
        ]);

        $requestLetterPath = null;
        if ($request->hasFile('request_letter')) {
            $path = $request->file('request_letter')->store('msme/letters', 'public');
            $requestLetterPath = '/storage/' . $path;
        }

        $otherDocsPath = null;
        if ($request->hasFile('other_docs')) {
            $path = $request->file('other_docs')->store('msme/docs', 'public');
            $otherDocsPath = '/storage/' . $path;
        }

        $assistanceRequest = MsmeAssistanceRequest::create([
            'user_id' => $user instanceof \App\Models\User ? $user->id : null,
            'company_name' => $validated['company_name'],
            'contact_person' => $validated['contact_person'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'classification' => $validated['classification'],
            'description' => $validated['description'],
            'request_letter_path' => $requestLetterPath,
            'other_docs_path' => $otherDocsPath,
            'status' => 'Submitted',
        ]);

        return response()->json([
            'message' => 'Business Processing Assistance request submitted successfully!',
            'request' => $assistanceRequest,
        ], 201);
    }

    /**
     * Display the specified MSME assistance request.
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $assistanceRequest = MsmeAssistanceRequest::with('user')->findOrFail($id);

        if (!($user instanceof \App\Models\Admin) && $assistanceRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($assistanceRequest);
    }

    /**
     * Update the specified MSME assistance request in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $assistanceRequest = MsmeAssistanceRequest::findOrFail($id);

        if ($user instanceof \App\Models\Admin) {
            $validated = $request->validate([
                'status' => 'sometimes|required|string|in:Submitted,Under Review,Endorsed,Processing,Completed',
                'admin_notes' => 'nullable|string',
            ]);

            if (isset($validated['status'])) {
                $assistanceRequest->status = $validated['status'];
                if ($validated['status'] === 'Completed') {
                    $assistanceRequest->completed_at = now();
                } else {
                    $assistanceRequest->completed_at = null;
                }
            }

            if (array_key_exists('admin_notes', $validated)) {
                $assistanceRequest->admin_notes = $validated['admin_notes'];
            }

            $assistanceRequest->save();

            return response()->json([
                'message' => 'Request status updated successfully.',
                'request' => $assistanceRequest,
            ]);
        }

        // Regular users
        if ($assistanceRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'contact_person' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|required|string|max:50',
            'description' => 'sometimes|required|string',
        ]);

        $assistanceRequest->update($validated);

        return response()->json([
            'message' => 'Request updated successfully.',
            'request' => $assistanceRequest,
        ]);
    }

    /**
     * Remove the specified MSME assistance request from storage.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $assistanceRequest = MsmeAssistanceRequest::findOrFail($id);

        if (!($user instanceof \App\Models\Admin) && $assistanceRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $assistanceRequest->delete();

        return response()->json([
            'message' => 'Request deleted successfully.',
        ]);
    }
}
