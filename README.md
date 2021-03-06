SSE With Mercure
---

A Laravel based demo application to subscribe & publish to Mercure.

## Article
Check the article here at [Medium](https://medium.com/@sirajul.anik/server-sent-events-with-mercure-in-laravel-lumen-14ddc41d3f15)

## Installation

This project already comes with docker. If you're familiar with docker, then you can just do the following. If you're not familiar with docker, then please run whatever suits you.

- Clone this repository.
- `cp docker-compose.yml.example docker-compose.yml`.
- Make changes to your `docker-compose.yml` file.
- `cp .env.example .env`.
- Make changes to your `.env` file.
- `php artisan key:generate` to generate key `APP_KEY`.
- `composer install` if you have composer installed in your machine.
- `docker-compose up -d --build`.
- If you don't have `composer` in your machine, then try installing from the container. `docker-compose exec php composer install`

You're now all good to go.

## Notes

- The frontend application uses react. So, if you don't want to build the JS code again, please run the nginx on port `8000` and mercure on port `9000`. Otherwise, build with the available commands.
- Laravel by default encrypts cookies. Please check the `App\Http\Middleware\EncryptCookies` class which instructs to leave `mercureAuthorization` as is from the controller.
- All the API calls are handled in the `routes/api.php`. Didn't want to use controller for this demo project.

## Commands

If you want to publish messages from the command line, use the following available artisan commands. Just remember that either run these commands from the container or change the Mercure hub URL from the `AppServiceProvider`. 

```shell
php artisan publish:message "topic-name" --private
php artisan publish:message "multiple,topic-name" --private
php artisan publish:message "public-topic"
php artisan publish:message "on-listener-type" --private --type=listener
php artisan publish:message "public-with-listener-type" --type=listener
```

## How bad does it look?

Here is an attached image of the projects. Play with it.
![](screenshots/screenshot-mercure-publisher-subscriber.png)
