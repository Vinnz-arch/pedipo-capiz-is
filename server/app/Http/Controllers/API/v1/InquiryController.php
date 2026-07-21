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
    public function index(): JsonResponse
    {
        $inquiries = Inquiry::with('opportunity.category')->latest()->get();

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
            'investor_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        $inquiry = Inquiry::create([
            'opportunity_id' => $validated['opportunity_id'] ?? null,
            'investor_name' => $validated['investor_name'],
            'email' => $validated['email'],
            'company' => $validated['company'] ?? null,
            'message' => $validated['message'],
            'status' => 'Pending',
        ]);

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
            'status' => 'required|string|in:Pending,Under Review,Approved,Rejected,Responded',
            'admin_notes' => 'nullable|string',
        ]);

        $inquiry->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $inquiry->admin_notes,
            'reviewed_at' => now(),
        ]);

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
