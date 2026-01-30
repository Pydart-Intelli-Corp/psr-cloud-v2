using Microsoft.EntityFrameworkCore;
using MachineAPI.Models;

namespace MachineAPI.Data
{
    public class MachineDbContext : DbContext
    {
        public MachineDbContext(DbContextOptions<MachineDbContext> options) : base(options)
        {
        }

        public DbSet<Machine> Machines { get; set; }
        public DbSet<MilkCollection> MilkCollections { get; set; }
        public DbSet<MilkDispatch> MilkDispatches { get; set; }
        public DbSet<MilkSale> MilkSales { get; set; }
        public DbSet<RateChart> RateCharts { get; set; }
        public DbSet<MachinePasswordLog> MachinePasswordLogs { get; set; }
        public DbSet<FarmerInfo> Farmers { get; set; }
        public DbSet<MachineStatistics> MachineStatistics { get; set; }
        public DbSet<MachineUpdate> MachineUpdates { get; set; }
        public DbSet<Society> Societies { get; set; }
        public DbSet<MachineCorrection> MachineCorrections { get; set; }
        public DbSet<MachineCorrectionWeb> MachineCorrectionsWeb { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Machine Configuration
            modelBuilder.Entity<Machine>(entity =>
            {
                entity.ToTable("machines");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.MachineType).HasDatabaseName("idx_machine_type");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.Status).HasDatabaseName("idx_status");
                entity.HasIndex(e => e.IsMasterMachine).HasDatabaseName("idx_is_master");
            });

            // MilkCollection Configuration
            modelBuilder.Entity<MilkCollection>(entity =>
            {
                entity.ToTable("milk_collections");
                entity.HasIndex(e => e.FarmerId).HasDatabaseName("idx_farmer_id");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.CollectionDate).HasDatabaseName("idx_collection_date");
                entity.HasIndex(e => e.ShiftType).HasDatabaseName("idx_shift_type");
                entity.HasIndex(e => new { e.SocietyId, e.CollectionDate }).HasDatabaseName("idx_society_date");
                
                entity.HasOne(c => c.Machine)
                      .WithMany(m => m.MilkCollections)
                      .HasForeignKey(c => c.MachineId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // MilkDispatch Configuration
            modelBuilder.Entity<MilkDispatch>(entity =>
            {
                entity.ToTable("milk_dispatches");
                entity.HasIndex(e => e.DispatchId).HasDatabaseName("idx_dispatch_id");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.DispatchDate).HasDatabaseName("idx_dispatch_date");
                entity.HasIndex(e => e.ShiftType).HasDatabaseName("idx_shift_type");
                
                entity.HasOne(d => d.Machine)
                      .WithMany(m => m.MilkDispatches)
                      .HasForeignKey(d => d.MachineId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // MilkSale Configuration
            modelBuilder.Entity<MilkSale>(entity =>
            {
                entity.ToTable("milk_sales");
                entity.HasIndex(e => e.Count).HasDatabaseName("idx_count");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.SalesDate).HasDatabaseName("idx_sales_date");
                
                entity.HasOne(s => s.Machine)
                      .WithMany(m => m.MilkSales)
                      .HasForeignKey(s => s.MachineId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // RateChart Configuration
            modelBuilder.Entity<RateChart>(entity =>
            {
                entity.ToTable("rate_charts");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.BmcId).HasDatabaseName("idx_bmc_id");
                entity.HasIndex(e => e.Channel).HasDatabaseName("idx_channel");
                entity.HasIndex(e => e.ValidFrom).HasDatabaseName("idx_valid_from");
                entity.HasIndex(e => e.ValidTo).HasDatabaseName("idx_valid_to");
                entity.HasIndex(e => e.IsActive).HasDatabaseName("idx_is_active");
            });

            // MachinePasswordLog Configuration
            modelBuilder.Entity<MachinePasswordLog>(entity =>
            {
                entity.ToTable("machine_password_logs");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.PasswordType).HasDatabaseName("idx_password_type");
                entity.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_created_at");
                
                entity.HasOne(p => p.Machine)
                      .WithMany()
                      .HasForeignKey(p => p.MachineId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // FarmerInfo Configuration
            modelBuilder.Entity<FarmerInfo>(entity =>
            {
                entity.ToTable("farmers");
                entity.HasIndex(e => e.FarmerId).HasDatabaseName("idx_farmer_id");
                entity.HasIndex(e => e.RfId).HasDatabaseName("idx_rf_id");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.Status).HasDatabaseName("idx_status");
            });

            // MachineStatistics Configuration
            modelBuilder.Entity<MachineStatistics>(entity =>
            {
                entity.ToTable("machine_statistics");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.StatisticsDate).HasDatabaseName("idx_statistics_date");
                entity.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_created_at");
                entity.HasIndex(e => e.RecordedAt).HasDatabaseName("idx_recorded_at");
                entity.HasIndex(e => new { e.MachineId, e.StatisticsDate }).HasDatabaseName("idx_machine_date");
            });

            // MachineUpdate Configuration
            modelBuilder.Entity<MachineUpdate>(entity =>
            {
                entity.ToTable("machine_updates");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.UpdateType).HasDatabaseName("idx_update_type");
                entity.HasIndex(e => e.CreatedAt).HasDatabaseName("idx_created_at");
            });

            // Society Configuration
            modelBuilder.Entity<Society>(entity =>
            {
                entity.ToTable("societies");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.BmcId).HasDatabaseName("idx_bmc_id");
            });

            // MachineCorrection Configuration
            modelBuilder.Entity<MachineCorrection>(entity =>
            {
                entity.ToTable("machine_corrections_from_machine");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => new { e.MachineId, e.SocietyId }).HasDatabaseName("idx_machine_society").IsUnique();
            });

            // MachineCorrectionWeb Configuration
            modelBuilder.Entity<MachineCorrectionWeb>(entity =>
            {
                entity.ToTable("machine_corrections");
                entity.HasIndex(e => e.MachineId).HasDatabaseName("idx_machine_id");
                entity.HasIndex(e => e.SocietyId).HasDatabaseName("idx_society_id");
                entity.HasIndex(e => e.Status).HasDatabaseName("idx_status");
                entity.HasIndex(e => new { e.MachineId, e.Status }).HasDatabaseName("idx_machine_status");
            });
        }
    }
}
