<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MsmeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_name' => $this->business_name,
            'owner_name' => $this->owner_name,
            'category_id' => $this->category_id,
            'category' => $this->relationLoaded('category') ? $this->category : null,
            'enterprise_type' => $this->enterprise_type,
            'municipality_id' => $this->municipality_id,
            'municipality' => $this->relationLoaded('municipality') ? $this->municipality : null,
            'barangay' => $this->barangay,
            'complete_address' => $this->complete_address,
            'contact_number' => $this->contact_number,
            'email_address' => $this->email_address,
            'business_description' => $this->business_description,
            'products_services' => $this->products_services,
            'logo_path' => $this->logo_path,
            'cover_path' => $this->cover_path,
            'product_image_1' => $this->product_image_1,
            'product_image_2' => $this->product_image_2,
            'product_image_3' => $this->product_image_3,
            'status' => $this->status,
            'date_registered' => $this->date_registered ? $this->date_registered->format('Y-m-d') : null,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_archived' => $this->is_archived,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
