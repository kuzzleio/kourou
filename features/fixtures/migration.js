function migrate(document) {
  const [firstName, lastName] = document.body.name.split(' ');

  return {
    _id: document._id,
    body: {
      firstName,
      lastName,
    }
  };
}