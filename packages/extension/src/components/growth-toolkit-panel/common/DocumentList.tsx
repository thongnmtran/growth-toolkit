import { ModelMap, ModelNames, isSameDoc } from '@growth-toolkit/common-models';
import { getStore } from '@growth-toolkit/common-modules';
import { uuid } from '@growth-toolkit/common-utils';
import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@suid/material';
import { For, createEffect, createSignal, onMount } from 'solid-js';
import CheckIcon from '../../icons/CheckIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import {
  createMutable,
  createStore,
  produce,
  reconcile,
  unwrap,
} from 'solid-js/store';

interface DocumentListProps<ModelName extends ModelNames> {
  modelName: ModelName;
  friendlyName: string;
  onSelect?: (item?: Doc<ModelMap[ModelName]>) => void;
  itemCreator?: (
    curItems: Doc<ModelMap[ModelName]>[],
  ) => Promise<ModelMap[ModelName]> | ModelMap[ModelName];
  onDelete?: (item: Doc<ModelMap[ModelName]>) => void | Promise<void>;
  labelProvider?: (item: Doc<ModelMap[ModelName]>) => string;
  onLoad?: (items: Doc<ModelMap[ModelName]>[]) => void;
}

function DocumentList<ModelName extends ModelNames>(
  props: DocumentListProps<ModelName>,
) {
  type ItemType = Doc<ModelMap[ModelName]>;

  const [items, setItems] = createStore<ItemType[]>([]);
  const [selectedItemId, setSelectedItemId] = createSignal('');

  const store = () => getStore(props.modelName);

  onMount(() => {
    loadAnalysises();
  });

  const loadAnalysises = async () => {
    const cachedModels = await store().findMany({ query: {} });
    cachedModels.sort((a, b) => b.updatedAt - a.updatedAt);
    props.onLoad?.(cachedModels);
    setItems(
      reconcile(cachedModels.map((model) => createMutable(model)) as never),
    );
  };

  const handleSelect = (item?: ItemType) => {
    props.onSelect?.(item);
    setSelectedItemId(item?._id ?? '');
  };

  createEffect(() => {
    [...items];
    const selected = items.find((item) => item._id === selectedItemId());
    handleSelect(selected || items[0]);
  });

  const handleCreate = async () => {
    const newRawItem = await props.itemCreator?.(unwrap(items));
    if (!newRawItem) {
      return;
    }
    const newItem: ItemType = createMutable({
      ...newRawItem,
      _id: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setItems(
      produce((prev) => {
        prev.unshift(newItem);
      }),
    );
    handleSelect(newItem);
    await store().create(unwrap(newItem));
  };

  const handleDelete = async (item: ItemType) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    // Delete related resources
    await props.onDelete?.(item);

    // Delete main document
    await store().delete({ ref: item._id });
    if (isSameDoc(selectedItemId(), item)) {
      setSelectedItemId(item?._id ?? '');
    }
    await loadAnalysises();
  };

  return (
    <Stack width={300} spacing={2}>
      <Button variant="contained" onClick={handleCreate} fullWidth>
        + New {props.friendlyName}
      </Button>
      <List dense>
        <For each={items}>
          {(item) => (
            <ListItem
              disablePadding
              // disableGutters
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(item)}
                  sx={{ '&:hover': { color: '#e87272' } }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => handleSelect(item)}
                selected={isSameDoc(selectedItemId(), item)}
              >
                <ListItemIcon sx={{ minWidth: '30px' }}>
                  <CheckIcon />
                </ListItemIcon>
                <ListItemText primary={props.labelProvider?.(item)} />
              </ListItemButton>
            </ListItem>
          )}
        </For>
      </List>
    </Stack>
  );
}

export default DocumentList;
