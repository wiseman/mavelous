import argparse
import sys

import jinja2


def render_template(template_file, env):
  template_str = template_file.read()
  template = jinja2.Template(template_str)
  expanded_str = template.render(**env)
  return expanded_str


def parse_define(v):
  equal_pos = v.find('=')
  if equal_pos >= 0:
    return v[:equal_pos], v[equal_pos + 1:]
  else:
    return v, True


def create_env(defines):
  env = {}
  if defines:
    for key, value in [parse_define(d) for d in defines]:
      env[key] = value
  return env


def main(argv):
  parser = argparse.ArgumentParser(
    description='Expand a static jinja template file.')
  parser.add_argument('template_file', type=argparse.FileType('r'))
  parser.add_argument(
    '-D', '--define', action='append', help='Define a template value.')
  parser.add_argument('--output_file', type=argparse.FileType('w'),
                      default=sys.stdout)
  args = parser.parse_args(args=argv[1:])
  env = create_env(args.define)
  result = render_template(args.template_file, env)
  args.output_file.write(result)


if __name__ == '__main__':
  main(sys.argv)
