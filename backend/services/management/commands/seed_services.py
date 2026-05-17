from django.core.management.base import BaseCommand

from services.models import Category, Tag


class Command(BaseCommand):
    help = "Seed initial service categories and tags."

    def handle(self, *args, **options):
        categories = [
            {
                "name": "Education",
                "icon": "book-open",
            },
            {
                "name": "Home Services",
                "icon": "home",
            },
            {
                "name": "Design",
                "icon": "palette",
            },
            {
                "name": "IT",
                "icon": "laptop",
            },
            {
                "name": "Health",
                "icon": "heart",
            },
            {
                "name": "Events",
                "icon": "calendar",
            },
        ]

        tags = [
            "Electrician",
            "Plumber",
            "Tutor",
            "Graphic Design",
            "Web Development",
            "Home Repair",
            "Cleaning",
            "Photography",
            "Fitness",
            "Emergency",
        ]

        for category_data in categories:
            category, created = Category.objects.get_or_create(
                name=category_data["name"],
                defaults={
                    "icon": category_data["icon"],
                },
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created category: {category.name}")
                )
            else:
                self.stdout.write(f"Category already exists: {category.name}")

        for tag_name in tags:
            tag, created = Tag.objects.get_or_create(name=tag_name)

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Created tag: {tag.name}")
                )
            else:
                self.stdout.write(f"Tag already exists: {tag.name}")

        self.stdout.write(
            self.style.SUCCESS("Service seed data completed.")
        )