$(document).ready(() => {
  $('.delete-article').click((e) => {
    $.ajax({
      type: 'DELETE',
      url: '/articles/' + $(e.target).attr('data-id'),
      success: (res) => {
        alert('Deleting article...');
        window.location.href='/';
      },
      error: (err) => {
        console.log(err);
      }
    });
  });
});
