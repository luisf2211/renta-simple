-- Seed a standard amenity catalogue for the Aybar tenant (Spanish labels).
-- Idempotent: skips names that already exist (unique on tenant_id+lower(name)).

insert into public.amenities (tenant_id, name, icon, category, sort_order)
values
  -- Conectividad
  ('11111111-1111-1111-1111-111111111111', 'Apple CarPlay',        'Smartphone',   'CONNECTIVITY', 10),
  ('11111111-1111-1111-1111-111111111111', 'Android Auto',         'Smartphone',   'CONNECTIVITY', 20),
  ('11111111-1111-1111-1111-111111111111', 'Bluetooth',            'Bluetooth',    'CONNECTIVITY', 30),
  ('11111111-1111-1111-1111-111111111111', 'Puertos USB',          'Usb',          'CONNECTIVITY', 40),
  ('11111111-1111-1111-1111-111111111111', 'Pantalla táctil',      'MonitorSmartphone', 'CONNECTIVITY', 50),
  ('11111111-1111-1111-1111-111111111111', 'GPS / Navegación',     'Navigation',   'CONNECTIVITY', 60),
  -- Confort
  ('11111111-1111-1111-1111-111111111111', 'Aire acondicionado',   'Snowflake',    'COMFORT',      110),
  ('11111111-1111-1111-1111-111111111111', 'Asientos de cuero',    'Armchair',     'COMFORT',      120),
  ('11111111-1111-1111-1111-111111111111', 'Asientos eléctricos',  'Armchair',     'COMFORT',      130),
  ('11111111-1111-1111-1111-111111111111', 'Techo panorámico',     'Sun',          'COMFORT',      140),
  ('11111111-1111-1111-1111-111111111111', 'Arranque sin llave',   'KeyRound',     'COMFORT',      150),
  ('11111111-1111-1111-1111-111111111111', 'Control crucero',      'Gauge',        'COMFORT',      160),
  -- Seguridad
  ('11111111-1111-1111-1111-111111111111', 'Cámara de reversa',    'Camera',       'SAFETY',       210),
  ('11111111-1111-1111-1111-111111111111', 'Sensores de parqueo',  'Radar',        'SAFETY',       220),
  ('11111111-1111-1111-1111-111111111111', 'Frenos ABS',           'Disc',         'SAFETY',       230),
  ('11111111-1111-1111-1111-111111111111', 'Airbags',              'ShieldCheck',  'SAFETY',       240),
  ('11111111-1111-1111-1111-111111111111', 'Alarma',               'Siren',        'SAFETY',       250),
  -- Capacidad / mecánica
  ('11111111-1111-1111-1111-111111111111', 'Transmisión automática','Cog',         'CAPACITY',     310),
  ('11111111-1111-1111-1111-111111111111', 'Tracción 4x4',         'Mountain',     'CAPACITY',     320),
  ('11111111-1111-1111-1111-111111111111', '5 pasajeros',          'Users',        'CAPACITY',     330),
  ('11111111-1111-1111-1111-111111111111', '7 pasajeros',          'Users',        'CAPACITY',     340),
  ('11111111-1111-1111-1111-111111111111', 'Baúl amplio',          'Package',      'CAPACITY',     350)
on conflict (tenant_id, lower(name)) do nothing;
