export function entityI(parentRoute: string, ...subRoutes: string[]) {
  return (id: string | number) => `${parentRoute}/${id}/${subRoutes.join('/')}`;
}
