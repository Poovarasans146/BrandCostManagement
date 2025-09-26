using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("Users")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("username")]
    [StringLength(50)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [Column("fullname")]
    [StringLength(50)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [Column("password")]
    [StringLength(255)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Column("role")]
    [StringLength(20)]
    public string Role { get; set; } = "viewer";
}
