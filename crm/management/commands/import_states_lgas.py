# crm/management/commands/import_states_lgas.py
import csv
from django.core.management.base import BaseCommand
from portal.models import State, Lga  # Importing from portal since models are shared

class Command(BaseCommand):
    help = 'Import states and LGAs from CSV file into CRM system'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')
        parser.add_argument(
            '--update',
            action='store_true',
            help='Update existing records instead of skipping'
        )

    def handle(self, *args, **options):
        csv_path = options['csv_file']
        should_update = options['update']
        stats = {'created': 0, 'updated': 0, 'skipped': 0}

        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
                reader = csv.reader(file)
                
                # Skip header if exists
                if csv.Sniffer().has_header(file.read(1024)):
                    file.seek(0)
                    next(reader)
                    file.seek(0)
                    next(reader)
                
                for row in reader:
                    if len(row) < 2:
                        continue

                    state_name = row[0].strip()
                    lga_name = row[1].strip()

                    if not state_name or not lga_name:
                        stats['skipped'] += 1
                        continue

                    # Get or create state
                    state, state_created = State.objects.get_or_create(
                        name=state_name,
                        defaults={'capital': row[2].strip() if len(row) > 2 else ''}
                    )

                    # Handle LGA
                    lga, lga_created = Lga.objects.get_or_create(
                        name=lga_name,
                        state_of_origin=state
                    )

                    if should_update and not lga_created:
                        lga.name = lga_name
                        lga.state_of_origin = state
                        lga.save()
                        stats['updated'] += 1
                    elif lga_created:
                        stats['created'] += 1
                    else:
                        stats['skipped'] += 1

        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"File not found: {csv_path}"))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error processing file: {str(e)}"))
            return

        # Print results
        self.stdout.write(self.style.SUCCESS(
            f"Import completed: {stats['created']} created, "
            f"{stats['updated']} updated, {stats['skipped']} skipped"
        ))