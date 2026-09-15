<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMsmeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'enterprise_type' => 'required|string|in:Micro,Small,Medium',
            'municipality_id' => 'required|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
            'barangay' => 'required|string|max:255',
            'complete_address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'email_address' => 'nullable|email|max:255',
            'business_description' => 'required|string',
            'products_services' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'cover' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'product_image_1' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'product_image_2' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'product_image_3' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'status' => 'nullable|string|in:Active,Inactive,Pending Approval',
            'date_registered' => 'required|date',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}
