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

        $inquiry = Inquiry::create([
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
