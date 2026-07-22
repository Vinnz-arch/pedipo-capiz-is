<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingPageSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'hero_badge',
        'hero_title',
        'hero_subtitle',
        'hero_description',
        'hero_image_path',
        'vision_text',
        'mission_point_1',
        'mission_point_2',
        'mission_point_3',
        'msme_title',
        'msme_description',
        'msme_image_path',
        'mandate_text',
        'mandate_image_path',
        'service_pledge_1',
        'service_pledge_2',
        'service_pledge_3',
        'service_pledge_4',
        'contact_address',
        'contact_email',
        'contact_phone',
        'contact_facebook',
        'contact_twitter',
        'contact_linkedin',
        'division_1_title',
        'division_1_subtitle',
        'division_1_bullets',
        'division_2_title',
        'division_2_subtitle',
        'division_2_bullets',
        'division_3_title',
        'division_3_subtitle',
        'division_3_bullets',
    ];
}
