"""Pure geometry validation shared by capture and its offline regression tests."""


def client_capture_rect(window_rect, client_rect, image_size):
    width = client_rect["right"] - client_rect["left"]
    height = client_rect["bottom"] - client_rect["top"]
    if width <= 0 or height <= 0 or tuple(image_size) != (width, height):
        raise ValueError("Captured pixels do not match the observed physical client rectangle")
    if not (window_rect["left"] <= client_rect["left"] < client_rect["right"] <= window_rect["right"]
            and window_rect["top"] <= client_rect["top"] < client_rect["bottom"] <= window_rect["bottom"]):
        raise ValueError("Client rectangle is outside its owning window")
    return dict(client_rect)


def crop_edge_occlusion(rect, blocker):
    """Remove a fully covered edge only; interior or excessive occlusion is rejected."""
    out = dict(rect)
    if (max(rect['left'], blocker['left']) >= min(rect['right'], blocker['right'])
            or max(rect['top'], blocker['top']) >= min(rect['bottom'], blocker['bottom'])):
        return out
    if blocker['left'] <= rect['left'] and blocker['right'] >= rect['right']:
        if blocker['top'] <= rect['top']:
            out['top'] = blocker['bottom']
        elif blocker['bottom'] >= rect['bottom']:
            out['bottom'] = blocker['top']
        else:
            raise ValueError('Interior horizontal occlusion')
    elif blocker['top'] <= rect['top'] and blocker['bottom'] >= rect['bottom']:
        if blocker['left'] <= rect['left']:
            out['left'] = blocker['right']
        elif blocker['right'] >= rect['right']:
            out['right'] = blocker['left']
        else:
            raise ValueError('Interior vertical occlusion')
    else:
        raise ValueError('Partial or interior occlusion')
    if out['right']-out['left'] < 128 or out['bottom']-out['top'] < 128:
        raise ValueError('Insufficient visible area')
    return out
