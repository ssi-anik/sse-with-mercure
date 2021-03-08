<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mercure\Jwt\StaticJwtProvider;
use Symfony\Component\Mercure\Publisher;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        $this->app->bind(Publisher::class, function () {
            $url = 'http://mercure/.well-known/mercure';
            $token = env('MERCURE_PUBLISHER_JWT_KEY');
            $jwtProvider = new StaticJwtProvider($token);

            return new Publisher($url, $jwtProvider);
        });
    }
}
