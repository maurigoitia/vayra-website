from google.cloud import dns

client = dns.Client(project='vayra-team')
zone = client.zone('vayra-team')

record_set = zone.resource_record_set(
    'tbolt.vayra.team.', 'TXT', 300, ['"2c454a63-d20b-483c-91e6-6dac398be549"']
)
changes = zone.changes()
changes.add_record_set(record_set)
changes.create()
print("Record added")
