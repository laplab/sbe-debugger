from jinja2 import Template

from bson.json_util import loads
from textwrap import indent
from collections import defaultdict

slot_ids = None

def split_entity_with_id(entity_with_id):
        start = 1
        end = start
        while entity_with_id[end] != ']':
            end += 1

        return entity_with_id[start:end], entity_with_id[end + 1:].strip()

def render_stage(node):
    stage_id, stage_name = split_entity_with_id(node['stageId'])
    return f'<span class="stage" data-id="{stage_id}" id="id{stage_id}">{stage_name}</span>'

def render_expr(expr, meaning=''):
    if expr is None:
        return '{}'
    expr_id, expr = split_entity_with_id(expr)
    return f'<span class="expr" data-id="{expr_id}" id="id{expr_id}" data-meaning="{meaning}">{expr}</span>'

def render_slot(slot, meaning=''):
    if slot is None:
        return ''
    slot_id = slot_ids[str(slot)]
    return f'<span class="slot" data-id="{slot_id}" id="id{slot_id}" data-meaning="{meaning}">s{slot}</span>'

def template(string):
    return string.strip(' \n\r\t')

def render_traverse(node):
    # TODO laplab: Handle correlated slots.
    return template(f'''
{render_stage(node)} \
{render_slot(node['inputSlot'], 'Input value and current array element')} \
{render_slot(node['outputSlot'], 'Output value')} \
{render_slot(node['outputSlotInner'], 'Output from the inner side')} \
{render_expr(node['fold'], 'Fold expression')} \
{render_expr(node['final'], 'Final expression')}
from
{render_node(node['children'][0], True)}
in
{render_node(node['children'][1], True)}
    ''')

def render_filter(node):
    return template(f'''
{render_stage(node)} {render_expr(node['filter'], 'Filter expression')}
{render_node(node['children'][0])}
    ''')

def render_project(node):
    projections = []
    for slot, expr in node['projections'].items():
        projections.append(f'{render_slot(slot)} = {render_expr(expr)}')

    return template(f'''
{render_stage(node)} {', '.join(projections)}
{render_node(node['children'][0])}
    ''')

def render_limit(node):
    # TODO laplab: Handle skip. Handle optional limit.
    return template(f'''
{render_stage(node)} {node['limit']}
{render_node(node['children'][0])}
    ''')

def render_coscan(node):
    return f'{render_stage(node)}'

def render_scan(node):
    # TODO laplab: Handle output slots.
    return template(f'''
{render_stage(node)} \
{render_slot(node['recordSlot'], 'Record from storage')} \
{render_slot(node['recordIdSlot'], 'Record id for the record from storage')} \
{render_slot(node['seekKeySlot'], 'Record id pointing to the desired record')} \
{render_slot(node['snapshotIdSlot'], 'Id of a storage snapshot')} \
{render_slot(node['indexIdSlot'], 'Id of an index which was used to find the document')} \
{render_slot(node['indexKeySlot'], 'Index key slot')} \
{render_slot(node['indexKeyPatternSlot'], 'Key pattern of an index which was used to find the document')} \
    ''')

def render_node(node, bump=False):
    node = defaultdict(lambda: None, node)
    _, stage_name = split_entity_with_id(node['stageId'])
    renderers = {
        # TODO laplab: Handle synonyms for stages.
        'filter': render_filter,
        'traverse': render_traverse,
        'project': render_project,
        'limit': render_limit,
        'coscan': render_coscan,
        'scan': render_scan,
    }
    result = renderers[stage_name](node)
    if bump:
        result = indent(result, '    ')
    return result

def main():
    with open('../mongo/session.sbe.debugger', 'r') as f:
        tree = None
        frames = []
        for line in f:
            decoded = loads(line)
            if tree is None:
                tree = decoded
            else:
                frames.append(decoded)

    global slot_ids
    slot_ids = tree['slots']
    rendered_tree = render_node(tree['stages'])

    with open('templates/index.html.j2', 'r') as f:
        template = Template(f.read())

    with open('build/index.html', 'w') as f:
        rendered_index = template.render(tree=rendered_tree)
        f.write(rendered_index)

if __name__ == '__main__':
    main()